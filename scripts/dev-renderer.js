const chalk = require("chalk");
const { createServer, createLogger } = require("vite");
const { RENDERER_ROOT } = require("./constants");

async function startRenderer() {
  try {
    const viteServer = await createServer({
      root: RENDERER_ROOT,
    });
    await viteServer.listen();
    return viteServer;
  } catch (error) {
    createLogger().error(
      chalk.red(`error when starting dev server:\n${error.stack}`)
    );
  }
}
startRenderer();
