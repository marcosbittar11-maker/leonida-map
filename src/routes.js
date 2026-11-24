import { gameDistance } from './model.js';

export function graphFromRoads(data) {
  const graph = new Map();
  function vertex([x,y]) {
    const id = x + ',' + y;
    if (!graph.has(id)) graph.set(id,{id,x,y,neighbors:new Map()});
    return graph.get(id);
  }
  for (const feature of data.features) {
    if (feature.geometry?.type !== 'LineString') continue;
    const nodes = feature.geometry.coordinates.map(vertex);
    for (let i=1; i<nodes.length; i++) {
      const a=nodes[i-1], b=nodes[i], d=gameDistance(a,b);
      if (!d) continue;
      a.neighbors.set(b.id,d); b.neighbors.set(a.id,d);
    }
  }
  return graph;
}

class Queue {
  heap=[];
  push(item) {
    const heap=this.heap;
    let i=heap.length;
    heap.push(item);
    while (i>0) {
      const parent=(i-1)>>1;
      if (heap[parent].score<=item.score) break;
      heap[i]=heap[parent]; i=parent;
    }
    heap[i]=item;
  }
  pop() {
    const heap=this.heap, top=heap[0], last=heap.pop();
    if (!heap.length) return top;
    let i=0;
    while (i*2+1<heap.length) {
      let child=i*2+1;
      if (child+1<heap.length && heap[child+1].score<heap[child].score) child++;
      if (last.score<=heap[child].score) break;
      heap[i]=heap[child]; i=child;
    }
    heap[i]=last;
    return top;
  }
}

export function routeLeg(a,b,graph) {
  const straight=gameDistance(a,b);
  const fallback={a,b,straight,length:straight,known:false,points:[a,b]};
  if (!graph) return fallback;
  function closest(point) {
    let best, total=140;
    for (const vertex of graph.values()) {
      const delta=gameDistance(point,vertex);
      if (vertex.neighbors.size && delta<total) { best=vertex; total=delta; }
    }
    return best;
  }
  const start=closest(a), target=closest(b);
  if (!start || !target || start===target) return fallback;
  const path=new Map(), costs=new Map([[start.id,0]]), queue=new Queue();
  queue.push({node:start, cost:0, score:gameDistance(start,target)});
  while(queue.heap.length) {
    const {node,cost}=queue.pop();
    if (cost!==costs.get(node.id)) continue;
    if (node===target) {
      const points=[node];
      while(points.at(-1)!==start) points.push(path.get(points.at(-1).id));
      return {a,b,straight,length:cost,known:true,points:points.reverse(),access:gameDistance(a,start)+gameDistance(b,target)};
    }
    for (const [id,delta] of node.neighbors) {
      const next=cost+delta;
      if (next>=(costs.get(id)??Infinity)) continue;
      const vertex=graph.get(id);
      costs.set(id,next); path.set(id,node);
      queue.push({node:vertex,cost:next,score:next+gameDistance(vertex,target)});
    }
  }
  return fallback;
}

