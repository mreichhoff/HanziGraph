// Pure geometry and data helpers shared by the explorer and its regression tests.
export const isCharacter = value => /^\p{Script=Han}$/u.test(value);

export function buildExplorerGraph(words, excludedEdges = new Set()) {
    const graph = {};
    const thresholds = [1000, 2000, 4000, 7000, 10000, Infinity];
    words.forEach((word, index) => {
        const chars = [...new Set([...word].filter(isCharacter))];
        const level = thresholds.findIndex(threshold => index + 1 <= threshold) + 1;
        for (const char of chars) {
            graph[char] ||= { node: { level }, edges: {} };
            if (excludedEdges.has(word)) continue;
            for (const other of chars) {
                if (char === other) continue;
                // Retain every neighbor, in frequency order, rather than truncating
                // at eight. Limit only the example words stored for each pair.
                const edge = graph[char].edges[other] ||= { level, rank:index + 1, words: [] };
                if (edge.words.length < 2) edge.words.push(word);
            }
        }
    });
    return graph;
}

export function overlapArea(a, b, gap = 12) {
    return Math.max(0, Math.min(a.x + a.width + gap, b.x + b.width) - Math.max(a.x - gap, b.x)) *
        Math.max(0, Math.min(a.y + a.height + gap, b.y + b.height) - Math.max(a.y - gap, b.y));
}

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const validRect = rect => rect && [rect.x, rect.y, rect.width, rect.height].every(Number.isFinite);
function safePlacement(anchor, size, bounds) {
    return {
        anchor:{x:finite(anchor.x), y:finite(anchor.y)},
        size:{width:Math.max(0, finite(size.width)), height:Math.max(0, finite(size.height))},
        bounds:{x:finite(bounds.x), y:finite(bounds.y), width:Math.max(0, finite(bounds.width)), height:Math.max(0, finite(bounds.height))}
    };
}
export function placeCard(anchor, size, bounds, obstacles) {
    ({anchor, size, bounds} = safePlacement(anchor, size, bounds));
    obstacles = obstacles.filter(validRect);
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const desired = { x: anchor.x - 28, y: anchor.y - 28 };
    const xs = [desired.x, bounds.x, bounds.x + bounds.width - size.width];
    const ys = [desired.y, bounds.y, bounds.y + bounds.height - size.height];
    for (const rect of obstacles) {
        xs.push(rect.x - size.width - 12, rect.x + rect.width + 12);
        ys.push(rect.y - size.height - 12, rect.y + rect.height + 12);
    }
    let best, bestScore = Infinity;
    for (const x of xs) for (const y of ys) {
        const rect = { ...size,
            x: clamp(x, bounds.x, bounds.x + bounds.width - size.width),
            y: clamp(y, bounds.y, bounds.y + bounds.height - size.height) };
        const overlap = obstacles.reduce((sum, obstacle) => sum + overlapArea(rect, obstacle), 0);
        const score = overlap * 1e6 + Math.hypot(rect.x - desired.x, rect.y - desired.y);
        if (score < bestScore) { best = rect; bestScore = score; }
    }
    return best;
}

export function segmentsCross(a, b, c, d) {
    const cross = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    return cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0;
}

// A small degree budget and shortest-first, non-crossing links keep the visible
// graph readable. This affects the drawing only, not the dictionary adjacency.
// A bounded penalty gives a common word up to 80px of preference. Geometry
// remains a hard constraint; frequency never creates long or crossing edges.
export function edgeScore(distance, rank) {
    const penalty = Number.isFinite(rank) && rank > 0 ? Math.min(1, Math.log1p(rank / 100) / Math.log1p(300)) * 80 : 0;
    return distance + penalty;
}
// Selection may cross other edges, but never unrelated nodes. Only use visible
// neighbors, and leave the ordinary drawing (including forced words) untouched.
export function selectionConnections(source, nodes, graph, existing, limit = 4, maxDistance = 420) {
    const origin = nodes.find(node => node.id === source)?.position;
    if (!origin) return [];
    const candidates = [];
    for (const { id: target, position } of nodes) {
        const edge = graph[source]?.edges[target];
        const id = `edge:${[source, target].sort().join(':')}`;
        if (target === source || !edge?.words?.length || existing.has(id)) continue;
        const dx = position.x - origin.x, dy = position.y - origin.y;
        const squared = dx * dx + dy * dy, distance = Math.sqrt(squared);
        if (!distance || distance > maxDistance) continue;
        if (nodes.some(node => {
            if (node.id === source || node.id === target) return false;
            const px = node.position.x - origin.x, py = node.position.y - origin.y;
            const t = (px * dx + py * dy) / squared;
            return t > 0 && t < 1 && Math.hypot(px - t * dx, py - t * dy) < 35;
        })) continue;
        candidates.push({ id, source, target, edge, distance });
    }
    return candidates.sort((a, b) => edgeScore(a.distance, a.edge.rank) - edgeScore(b.distance, b.edge.rank) || a.id.localeCompare(b.id)).slice(0, limit);
}

export function sparseConnections(nodes, graph, maxDistance = 270) {
    const positions = new Map(nodes.map(node => [node.id, node.position]));
    const candidates = new Map();
    for (const { id: source, position } of nodes) {
        for (const [target, edge] of Object.entries(graph[source]?.edges || {})) {
            const other = positions.get(target);
            if (!other || target === source) continue;
            const distance = Math.hypot(position.x - other.x, position.y - other.y);
            if (distance > maxDistance) continue;
            const id = `edge:${[source, target].sort().join(':')}`;
            if (!candidates.has(id)) candidates.set(id, { id, source, target, edge, distance });
        }
    }
    const chosen = [], degrees = new Map();
    for (const candidate of [...candidates.values()].sort((a, b) => edgeScore(a.distance, a.edge.rank) - edgeScore(b.distance, b.edge.rank) || a.distance - b.distance)) {
        if ((degrees.get(candidate.source) || 0) >= 3 || (degrees.get(candidate.target) || 0) >= 3) continue;
        const a = positions.get(candidate.source), b = positions.get(candidate.target);
        if (chosen.some(edge => segmentsCross(a, b, positions.get(edge.source), positions.get(edge.target)))) continue;
        // Avoid drawing a link through an unrelated character.
        const dx = b.x - a.x, dy = b.y - a.y, squared = dx * dx + dy * dy;
        if (!squared) continue;
        if (nodes.some(node => {
            if (node.id === candidate.source || node.id === candidate.target) return false;
            const p = node.position;
            const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / squared;
            return t > 0 && t < 1 && Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy) < 35;
        })) continue;
        chosen.push(candidate);
        for (const id of [candidate.source, candidate.target]) degrees.set(id, (degrees.get(id) || 0) + 1);
    }
    return chosen;
}

// Place a requested neighbor beside its character: the nearest free ring position,
// preferring one that is on screen and not hidden behind an open card.
export function neighborPosition(origin, occupied, extent, blocked = [], spacing = 100, margin = 40) {
    const inside = point => !extent || (point.x > extent.x1 + margin && point.x < extent.x2 - margin &&
        point.y > extent.y1 + margin && point.y < extent.y2 - margin);
    const hidden = point => blocked.some(box => point.x > box.x1 - margin && point.x < box.x2 + margin &&
        point.y > box.y1 - margin && point.y < box.y2 + margin);
    let best, score = Infinity;
    let roomiest, clearest = -Infinity;
    for (let step = 0; step < 64; step++) {
        const angle = step * 2.399963;
        const radius = 120 + Math.floor(step / 16) * 34;
        const point = { x: origin.x + Math.cos(angle) * radius, y: origin.y + Math.sin(angle) * radius };
        const clearance = occupied.length ? Math.min(...occupied.map(other => Math.hypot(point.x - other.x, point.y - other.y))) : Infinity;
        // A crowded neighborhood still keeps the character beside its anchor: the
        // roomiest nearby gap beats a free spot on the far side of the canvas.
        if (clearance > clearest) { clearest = clearance; roomiest = point; }
        if (clearance < spacing) continue;
        // Off-screen and card-covered spots stay available, but only as a last resort.
        const candidate = radius + (inside(point) ? 0 : 1200) + (hidden(point) ? 600 : 0);
        if (candidate < score) { score = candidate; best = point; }
    }
    return best || roomiest;
}

export function evictionOrder(nodes, extent, protectedIds, margin = 70) {
    const center = { x: (extent.x1 + extent.x2) / 2, y: (extent.y1 + extent.y2) / 2 };
    const distance = node => Math.hypot(node.position.x - center.x, node.position.y - center.y);
    return nodes.filter(node => {
        const p = node.position;
        return !protectedIds.has(node.id) &&
            (p.x < extent.x1 - margin || p.x > extent.x2 + margin || p.y < extent.y1 - margin || p.y > extent.y2 + margin);
    }).sort((a, b) => distance(b) - distance(a)).map(node => node.id);
}

// Search is an explicit request for this word, so these edges take precedence
// over the normal distance, degree, and crossing filters.
export function wordConnections(word, available) {
    const chars = [...word];
    const edges = new Map();
    for (let i = 1; i < chars.length; i++) {
        const source = chars[i - 1], target = chars[i];
        if (source === target || !available.has(source) || !available.has(target)) continue;
        const id = `edge:${[source, target].sort().join(':')}`;
        edges.set(id, { id, source, target, words: [word], label: word });
    }
    return [...edges.values()];
}

export function searchPositions(chars, origin, occupied, columns = 3) {
    const offsets = chars.map((id, index) => ({ id, x: index % columns * 125, y: Math.floor(index / columns) * 125 }));
    for (let attempt = 0; attempt < 180; attempt++) {
        const radius = attempt ? 100 + Math.sqrt(attempt) * 90 : 0;
        const angle = attempt * 2.399963;
        const result = offsets.map(p => ({ id: p.id, position: {
            x: origin.x + Math.cos(angle) * radius + p.x,
            y: origin.y + Math.sin(angle) * radius + p.y
        } }));
        if (result.every(p => occupied.every(q => Math.hypot(p.position.x - q.x, p.position.y - q.y) >= 100))) return result;
    }
    // A very dense remembered neighborhood still must not prevent a search.
    const right = Math.max(origin.x, ...occupied.map(p => p.x)) + 150;
    return offsets.map(p => ({ id: p.id, position: { x: right + p.x, y: origin.y + p.y } }));
}

// Keep the source node/edge visible beside the card. If a narrow viewport has
// no room, reserve a strip above the card and move the graph into that strip.
export function placeContextCard(anchor, size, bounds, context) {
    ({anchor, size, bounds} = safePlacement(anchor, size, bounds));
    if (!validRect(context) || context.width <= 0 || context.height <= 0) context = null;
    const rect = placeCard(anchor, size, bounds, context ? [context] : []);
    if (!context || overlapArea(rect, context, 12) === 0) return {rect, scale:1, shift:{x:0,y:0}};
    const height = Math.min(size.height, Math.max(120, bounds.height - 110));
    const dock = {x:bounds.x + (bounds.width - size.width) / 2, y:bounds.y + bounds.height - height, width:size.width, height};
    const room = {x:bounds.x + 12, y:bounds.y + 12, width:Math.max(1,bounds.width - 24), height:Math.max(1,dock.y - bounds.y - 36)};
    const scale = Math.min(1, room.width / context.width, room.height / context.height);
    return {rect:dock, scale, shift:{
        x:room.x + room.width / 2 - (context.x + context.width / 2) * scale,
        y:room.y + room.height / 2 - (context.y + context.height / 2) * scale
    }};
}
