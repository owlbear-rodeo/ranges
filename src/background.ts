import OBR from "@owlbear-rodeo/sdk";
import { createRangeTool } from "./rangeTool";

async function waitUntilOBRReady() {
  return new Promise<void>((resolve) => {
    OBR.onReady(() => {
      resolve();
    });
  });
}

async function init() {
  await waitUntilOBRReady();
  createRangeTool();
}

init();
