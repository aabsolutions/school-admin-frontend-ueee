function s(n){let e=new Map;for(let o of n){let c=e.get(o.seccion)??[];c.push(o),e.set(o.seccion,c)}return Array.from(e.entries()).map(([o,c])=>({nombre:o,documentos:c}))}export{s as a};
