import random,time,json
random.seed(2017)
n=8;N=n*n
adj=[[b for b in range(N) if abs(a%n-b%n)+abs(a//n-b//n)==1] for a in range(N)]
def dist(a,b):return abs(a%n-b%n)+abs(a//n-b//n)
def candidates(parts,hubs):
 ends={k for p in parts for k in [p[0],p[-1]]};reserved=ends|set(hubs);out=[]
 for i,path in enumerate(parts):
  a,z=path[0],path[-1];L=len(path);hub=hubs[i];blocked=reserved-{a,z,hub};choices=[]
  def walk(path,mask,seen):
   k=path[-1];left=L-len(path);d=dist(k,z) if seen else dist(k,hub)+dist(hub,z)
   if d>left or (left-d)%2:return
   if k==z:
    if left==0 and seen:choices.append((mask,path))
    return
   for b in adj[k]:
    if b not in blocked and not(mask>>b&1):walk(path+[b],mask|1<<b,seen or b==hub)
  walk([a],1<<a,hub is None or a==hub);out.append(choices)
 return out
def solve(cs,cap=2):
 sols=[];nodes=0
 def dfs(todo,mask,chosen):
  nonlocal nodes
  nodes+=1
  if nodes>200000:return
  if not todo:
   sols.append(chosen);return
  best=None
  for i in todo:
   poss=[x for x in cs[i] if not(x[0]&mask)]
   if not poss:return
   if best is None or len(poss)<len(best[1]):best=(i,poss)
  i,poss=best
  for m,p in poss:
   dfs([k for k in todo if k!=i],mask|m,chosen+[(i,p)])
   if len(sols)>=cap or nodes>200000:return
 dfs(list(range(len(cs))),0,[])
 return len(sols),nodes

from pathlib import Path
import re
source=(Path(__file__).parent/'puzzle-core.mjs').read_text()
p=json.loads(re.search(r'export const FINAL_PUZZLE=(.*);',source).group(1))
cs=candidates(p['solution'],p['hubs']);count,nodes=solve(cs)
assert nodes<=200000, 'search did not complete'
assert count==1, f'expected a unique solution, got {count}'
print(f'PASS: final puzzle unique solution; {sum(map(len,cs))} single-line candidates, {nodes} search nodes; no timer constraint')
