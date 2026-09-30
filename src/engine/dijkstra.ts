import { WALKING_SPEED_MPS } from '../data';
import type { FloorMap, GraphNode, Point, RouteResult } from '../types';

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function buildAdjacency(floorMap: FloorMap): Map<string, { to: string; weight: number }[]> {
  const nodeMap = new Map(floorMap.nodes.map((n) => [n.id, n]));
  const adj = new Map<string, { to: string; weight: number }[]>();

  for (const node of floorMap.nodes) {
    adj.set(node.id, []);
  }

  for (const edge of floorMap.edges) {
    const a = nodeMap.get(edge.from);
    const b = nodeMap.get(edge.to);
    if (!a || !b) continue;
    const w = dist(a, b);
    adj.get(edge.from)!.push({ to: edge.to, weight: w });
    adj.get(edge.to)!.push({ to: edge.from, weight: w });
  }

  return adj;
}

export function findNearestNode(point: Point, nodes: GraphNode[]): GraphNode {
  let best = nodes[0];
  let bestD = Infinity;
  for (const node of nodes) {
    const d = dist(point, node);
    if (d < bestD) {
      bestD = d;
      best = node;
    }
  }
  return best;
}

/**
 * Dijkstra shortest path on the floor graph.
 */
export function findShortestPath(
  floorMap: FloorMap,
  startNodeId: string,
  endNodeId: string,
): RouteResult | null {
  if (startNodeId === endNodeId) {
    const node = floorMap.nodes.find((n) => n.id === startNodeId);
    if (!node) return null;
    return {
      nodeIds: [startNodeId],
      points: [{ x: node.x, y: node.y }],
      distanceMeters: 0,
      durationMinutes: 0,
    };
  }

  const adj = buildAdjacency(floorMap);
  const nodeMap = new Map(floorMap.nodes.map((n) => [n.id, n]));
  const distMap = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  for (const node of floorMap.nodes) {
    distMap.set(node.id, Infinity);
    prev.set(node.id, null);
  }
  distMap.set(startNodeId, 0);

  while (visited.size < floorMap.nodes.length) {
    let u: string | null = null;
    let best = Infinity;
    for (const [id, d] of distMap) {
      if (!visited.has(id) && d < best) {
        best = d;
        u = id;
      }
    }
    if (u === null || best === Infinity) break;
    visited.add(u);
    if (u === endNodeId) break;

    for (const { to, weight } of adj.get(u) ?? []) {
      if (visited.has(to)) continue;
      const alt = best + weight;
      if (alt < (distMap.get(to) ?? Infinity)) {
        distMap.set(to, alt);
        prev.set(to, u);
      }
    }
  }

  if ((distMap.get(endNodeId) ?? Infinity) === Infinity) {
    return null;
  }

  const nodeIds: string[] = [];
  let cur: string | null = endNodeId;
  while (cur) {
    nodeIds.unshift(cur);
    cur = prev.get(cur) ?? null;
  }

  const points = nodeIds.map((id) => {
    const n = nodeMap.get(id)!;
    return { x: n.x, y: n.y };
  });

  const distanceMeters = distMap.get(endNodeId)!;
  const durationMinutes = distanceMeters / WALKING_SPEED_MPS / 60;

  return { nodeIds, points, distanceMeters, durationMinutes };
}

export function routeFromPosition(
  floorMap: FloorMap,
  userPosition: Point,
  destinationNodeId: string,
): RouteResult | null {
  const nearest = findNearestNode(userPosition, floorMap.nodes);
  const path = findShortestPath(floorMap, nearest.id, destinationNodeId);
  if (!path) return null;

  const firstNode = floorMap.nodes.find((n) => n.id === nearest.id)!;
  const leadIn = dist(userPosition, firstNode);
  const points = [{ x: userPosition.x, y: userPosition.y }, ...path.points];
  // Avoid duplicating if already on node
  if (leadIn < 0.3) {
    return path;
  }

  const distanceMeters = path.distanceMeters + leadIn;
  return {
    nodeIds: path.nodeIds,
    points,
    distanceMeters,
    durationMinutes: distanceMeters / WALKING_SPEED_MPS / 60,
  };
}
