import sys, numpy as np
from PIL import Image
d=sys.argv[1]; fs=[int(x) for x in sys.argv[2:]]
tot=[]
for f in fs:
    a=np.asarray(Image.open(f"{d}/p{f}.png").convert("L"),np.float32); b=np.asarray(Image.open(f"{d}/p{f+1}.png").convert("L"),np.float32)
    x=np.abs(a-b); H,W=x.shape
    r=[x[:H//3,:W//3].mean(),x[:H//3,2*W//3:].mean(),x[2*H//3:].mean(),x[H//4:3*H//4,W//3:2*W//3].mean()]
    tot.append(r); print(f, "bgTL=%.2f bgTR=%.2f floor=%.2f centre=%.2f"%tuple(r))
m=np.mean(tot,axis=0); print("MEAN bg=%.2f floor=%.2f centre=%.2f   (Miko bg~0.4, floor~0.6, centre~1.5)"%((m[0]+m[1])/2,m[2],m[3]))
