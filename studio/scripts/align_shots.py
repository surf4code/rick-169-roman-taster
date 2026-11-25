import json,re,sys,difflib
shots=json.load(open(sys.argv[1])); tl=json.load(open(sys.argv[2])); outp=sys.argv[3]; fps=tl["fps"]
norm=lambda w: re.sub(r"[^a-z0-9]","",w.lower().replace("’","'"))
W=[(norm(w["word"]),w) for w in tl["words"]]; W=[x for x in W if x[0]]
S=[];own=[]
for i,s in enumerate(shots):
    for tok in s["narration"].split():
        n=norm(tok)
        if n: S.append(n); own.append(i)
a=[x[0] for x in W]
sm=difflib.SequenceMatcher(None,S,a,autojunk=False)
mp={}
for b in sm.get_matching_blocks():
    for k in range(b.size): mp[b.a+k]=b.b+k
first={}
for k,i in enumerate(own):
    if k in mp and i not in first: first[i]=mp[k]
dur=tl["duration_sec"]; start=[None]*len(shots)
for i in range(len(shots)):
    if i in first: start[i]=W[first[i]][1]["start"]
# interpolate unmatched
for i in range(len(shots)):
    if start[i] is None:
        j=i-1
        while j>=0 and start[j] is None: j-=1
        k=i+1
        while k<len(shots) and start[k] is None: k+=1
        lo=start[j] if j>=0 else 0.0; hi=start[k] if k<len(shots) else dur
        start[i]=lo+(hi-lo)*(i-j)/(k-j)
start[0]=0.0
# monotonic
for i in range(1,len(start)):
    if start[i]<=start[i-1]: start[i]=start[i-1]+0.2
out=[];warn=[]
for i,s in enumerate(shots):
    e=start[i+1] if i+1<len(shots) else dur
    f0=round(start[i]*fps); f1=round(e*fps)
    s=dict(s); s["startFrame"]=f0; s["durFrames"]=max(8,f1-f0); s["matched"]=(i in first)
    out.append(s)
    d=(e-start[i])
    if d>12 or d<1.2: warn.append((s["id"],round(d,1)))
json.dump({"fps":fps,"total_frames":tl["total_frames"],"shots":out},open(outp,"w"),ensure_ascii=False,indent=1)
print("shots",len(out),"matched",sum(1 for s in out if s["matched"]),"match ratio words",round(sum(1 for k in mp)/len(S),3))
print("warn(dur>12 or <1.2):",warn[:40],len(warn))
