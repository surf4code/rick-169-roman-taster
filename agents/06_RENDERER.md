# RENDERER
No creative changes. Bump `rerun` in `render-request.json` and push to main; GitHub Actions renders 60 fps (`final.mp4`) and 30 fps (`final_30fps.mp4`) in the `final-video-and-qa` artifact (needs GitHub login to download).
Note: if the net change of render-request.json across pushed commits is zero, the workflow will not trigger; bump to a new number.
Then hand the mp4 path to QA. Never re-render without a QA FAIL or a change.
