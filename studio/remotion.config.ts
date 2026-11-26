import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");
Config.setJpegQuality(96);
Config.setPixelFormat("yuv420p");
Config.setCodec("h264");
Config.setOverwriteOutput(true);
