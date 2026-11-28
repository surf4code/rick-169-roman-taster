import subprocess, numpy as np
def load(path, ss, dur, w=320, h=180):
    cmd=["ffmpeg","-v","error","-ss",str(ss),"-t",str(dur),"-i",path,"-vf",f"scale={w}:{h},format=gray","-f","rawvideo","-"]
    raw=subprocess.run(cmd,capture_output=True).stdout
    n=len(raw)//(w*h); return np.frombuffer(raw[:n*w*h],np.uint8).reshape(n,h,w).astype(np.float32)
def rep(tag,a):
    d=np.abs(np.diff(a,axis=0)); keep=d.mean(axis=(1,2))<8; d=d[keep]
    H,W=a.shape[1:]
    reg={"top-left bg":d[:,:H//3,:W//3],"top-right bg":d[:,:H//3,2*W//3:],"floor/bottom":d[:,2*H//3:,:],"centre (chars)":d[:,H//4:3*H//4,W//3:2*W//3]}
    print(tag, "  ".join(f"{k}={v.mean():.2f}" for k,v in reg.items()))
M="/mnt/user-data/attachments/37078778-4d2c-5a53-93be-63d728068c30/cf1dd982-What_If_You_Could_See_Everyone_s_Lie_Count_-_Miko_720p_h264.mp4"
O="/mnt/user-data/attachments/37078778-4d2c-5a53-93be-63d728068c30/95317f79-final.mp4"
for ss in (60,120,240): rep(f"Miko@{ss}",load(M,ss,10))
rep("Ours@2",load(O,2,10)); rep("Ours@12",load(O,12,8))
