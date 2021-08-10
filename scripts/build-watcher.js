const fs = require("fs/promises")
const { spawn } = require("child_process")
const path = require("path")
const chalk = require("chalk")
const chokidar = require("chokidar")
const _ = require("lodash")

class BuildWatcher {
  constructor(transpiler) {
    this.isWatcherReady = false
    this.isAppStarted = false
    this.app = null
    this.transpiler = transpiler
    this.fsWatcher = null

    this.appInit = true
  }

  async exists() {
    try {
      await fs.access(
        path.join(__dirname, "../", "dist/prisma/prisma.binding.js")
      )
      return true
    } catch {
      return false
    }
  }

  getBuildFilePath(sourceFilePath) {
    const buildFileName = path.basename(sourceFilePath, ".ts") + ".js"
    const buildFileFolder = path.dirname(sourceFilePath).replace("src", "dist")
    return path.join(buildFileFolder, buildFileName)
  }

  async removeFile(sourceFilePath) {
    const buildFilePath = this.getBuildFilePath(sourceFilePath)
    await fs.unlink(buildFilePath)
    await fs.unlink(buildFilePath + ".map")
  }

  async removeFolder(sourceFolderPath) {
    const buildFolderPath = sourceFolderPath.replace("src", "dist")
    await fs.rmdir(buildFolderPath, { recursive: true })
  }

  async start(runOnce) {
    console.time(chalk.hex("#ff5faf")("App initialized in"))
    console.log(chalk.red("RM\t"), "dist")
    await this.removeFolder("dist")

    const debouncedStartApp = _.debounce(() => this.startApp(runOnce))

    const log = console.log.bind(console)

    this.fsWatcher = chokidar
      .watch("src/**", {
        ignored: new RegExp("[-.]test.ts"),
        usePolling: true,
        cwd: "./",
      })
      .on("add", async fileName => {
        if (path.extname(fileName) !== ".ts") {
          return
        }
        log(chalk.green("ADD\t"), fileName)
        const buildFilePath = this.getBuildFilePath(fileName)
        await this.transpiler(fileName, buildFilePath)
        debouncedStartApp()
      })
      .on("change", async fileName => {
        if (path.extname(fileName) !== ".ts") {
          return
        }
        log(chalk.yellow("CHANGE\t"), fileName)
        const buildFilePath = this.getBuildFilePath(fileName)
        await this.transpiler(fileName, buildFilePath)
        debouncedStartApp()
      })
      .on("unlink", async fileName => {
        if (path.extname(fileName) !== ".ts") {
          return
        }
        log(chalk.red("RM\t"), fileName)
        await this.removeFile(fileName)
        debouncedStartApp()
      })
      .on("unlinkDir", async path => {
        log(chalk.red("RMDIR\t"), path)
        await this.removeFolder(path)
      })
      .on("ready", () => {
        this.isWatcherReady = true
      })
  }

  async startApp(runOnce) {
    if (!this.isWatcherReady) {
      return
    }

    ///////////////////////////////////////////////////////////////////////////////
    //////  This check is the key. For the love of God do not mess with it.  //////
    ///////////////////////////////////////////////////////////////////////////////
    const ready = await this.exists()
    if (!ready) {
      return
    }

    if (runOnce) {
      process.exit(0)
    }

    console.log(chalk.blue("READY\t"), "file watcher")

    if (this.isAppStarted) {
      console.log(chalk.blue("RESTART\t"), chalk.bold("Monsoon\n"))
      await this.killApp()
    } else {
      this.isAppStarted = true
      console.log(chalk.blue("START\t"), chalk.bold("Monsoon\n"))
    }

    this.app = spawn("node", [
      "-r",
      "source-map-support/register",
      "dist/index.js",
    ])

    this.app.stdout.setEncoding("utf8")

    this.app.stdout.pipe(process.stdout)
    this.app.stderr.pipe(process.stderr)

    this.app.stdout.on("data", async data => {
      if (data.includes("🚀") && this.appInit) {
        console.timeEnd(chalk.hex("#ff5faf")("App initialized in"))
        this.appInit = false
      }
    })

    this.app.on("exit", (_, signal) => {
      console.log(
        chalk.red("STOP\t"),
        `Application process exited with signal ${signal}`
      )
    })
  }

  killApp() {
    return new Promise(resolve => {
      this.app.once("exit", () => resolve())
      this.app.kill("SIGINT")
    })
  }
}

module.exports = { BuildWatcher }
