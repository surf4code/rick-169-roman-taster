import subprocess, sys, numpy as np
def stats(path, ss, dur, tag, w=320, h=180):
    cmd=["ffmpeg","-v","error","-ss",str(ss),"-t",str(dur),"-i",path,"-vf",f"scale={w}:{h},format=gray","-f","rawvideo","-"]
    raw=subprocess.run(cmd,capture_output=True).stdout
    n=len(raw)//(w*h); a=np.frombuffer(raw[:n*w*h],np.uint8).reshape(n,w,h if False else w*0+h,w) if False else np.frombuffer(raw[:n*w*h],np.uint8).reshape(n,h,w).astype(np.float32)
    d=np.abs(np.diff(a,axis=0)).mean(axis=(1,2))
    # ignore hard cuts
    d=d[d<8]
    fro=(d<0.05).mean()
    print(f"{tag}: frames={n} mean={d.mean():.3f} median={np.median(d):.3f} p10={np.percentile(d,10):.3f} p90={np.percentile(d,90):.3f} frozen<0.05={fro*100:.0f}%  cv={d.std()/max(d.mean(),1e-6):.2f}")
M="/mnt/user-data/attachments/37078778-4d2c-5a53-93be-63d728068c30/cf1dd982-What_If_You_Could_See_Everyone_s_Lie_Count_-_Miko_720p_h264.mp4"
O="/mnt/user-data/attachments/37078778-4d2c-5a53-93be-63d728068c30/95317f79-final.mp4"
for ss in (60,120,240,400): stats(M,ss,12,f"Miko@{ss}s")
stats(O,2,12,"Ours(95317f79)@2s"); stats(O,12,12,"Ours@12s")
