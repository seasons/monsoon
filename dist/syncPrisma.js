"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_sync_1 = __importDefault(require("readline-sync"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const getAuth0Users_1 = require("./auth/getAuth0Users");
const prisma_binding_1 = require("prisma-binding");
exports.syncPrisma = (env) => __awaiter(void 0, void 0, void 0, function* () {
    let toHost;
    let toDBName;
    let toUsername;
    let toPort;
    let toSchema;
    let toEndpoint;
    let toSecret;
    switch (env) {
        case "staging":
            toHost = process.env.DB_STAGING_HOST;
            toDBName = process.env.DB_STAGING_DBNAME;
            toUsername = process.env.DB_STAGING_USERNAME;
            toPort = process.env.DB_STAGING_PORT;
            toEndpoint = process.env.DB_STAGING_ENDPOINT;
            toSecret = process.env.DB_STAGING_SECRET;
            toSchema = "monsoon$staging";
            break;
        case "local":
            toHost = process.env.DB_LOCAL_HOST;
            toDBName = process.env.DB_LOCAL_DBNAME;
            toUsername = process.env.DB_LOCAL_USERNAME;
            toPort = process.env.DB_LOCAL_PORT;
            toEndpoint = process.env.DB_LOCAL_ENDPOINT;
            toSecret = process.env.DB_LOCAL_SECRET;
            toSchema = "monsoon$dev";
            break;
    }
    if (readline_sync_1.default.keyInYN(getWarning({ toHost, toDBName, toPort, toUsername }))) {
        // Y key was pressed
        runSync(toHost, toPort, toUsername, toDBName, toSchema);
        exports.resetAuth0IDsForUsers({
            endpoint: toEndpoint,
            secret: toSecret,
        });
    }
    else {
        // Another key was pressed.
        console.log(`\n** Exited without syncing prisma **`);
    }
});
const runSync = (toHost, toPort, toUsername, toDBName, toSchema) => {
    // .pgpass specifies passwords for the databases
    fs_1.default.chmodSync("/tmp/.pgpass", 0o600);
    const execSyncWithOptions = getExecSyncWithOptions({
        stdio: "inherit",
        env: Object.assign(Object.assign({}, process.env), { PGPASSFILE: "/tmp/.pgpass" }),
    });
    // Copy monsoon$production schema and all contained tables as is to destination DB.
    // We are ok with this throwing a few errors.
    try {
        execSyncWithOptions(`pg_dump --format=t --clean --create --no-password --host=${process.env.DB_PRODUCTION_HOST}\
 --port=${process.env.DB_PRODUCTION_PORT} --username=${process.env.DB_PRODUCTION_USERNAME}\
 ${process.env.DB_PRODUCTION_DBNAME} | pg_restore --host=${toHost} --port=${toPort}\
 --username=${toUsername} --no-password --dbname=${toDBName}`);
    }
    catch (err) {
        console.log(err);
    }
    //  Drop the (old) monsoon$staging or monsoon$dev schema and all contained tables
    execSyncWithOptions(`echo 'DROP SCHEMA "${toSchema}" CASCADE' | psql --host=${toHost}\
 --port=${toPort} --username=${toUsername} --no-password --dbname=${toDBName}`);
    // Adjust the name of the schema to be appropriate for staging or dev
    execSyncWithOptions(`echo 'ALTER SCHEMA "monsoon$production" RENAME TO "${toSchema}"' | psql --host=${toHost}\
 --port=${toPort} --username=${toUsername} --no-password --dbname=${toDBName}`);
};
exports.resetAuth0IDsForUsers = ({ endpoint, secret, }) => __awaiter(void 0, void 0, void 0, function* () {
    const db = new prisma_binding_1.Prisma({
        typeDefs: "./src/prisma/prisma.graphql",
        endpoint,
        secret,
    });
    const prismaUsers = yield db.query.users({}, `{
        id
        email
    }`);
    const auth0Users = yield getAuth0Users_1.getAuth0Users();
    for (const prismaUser of prismaUsers) {
        const correspondingAuth0User = auth0Users.find(a => a.email === prismaUser.email);
        if (!!correspondingAuth0User) {
            console.log(`User w/Email: ${prismaUser.email} auth0ID synced with staging`);
            yield db.mutation.updateUser({
                where: { id: prismaUser.id },
                data: { auth0Id: correspondingAuth0User.user_id.split("|")[1] },
            });
        }
    }
});
exports.setDBEnvVarsFromJSON = (env, values) => {
    process.env[`DB_${env.toUpperCase()}_HOST`] = values.host;
    process.env[`DB_${env.toUpperCase()}_PORT`] = `${values.port}`;
    process.env[`DB_${env.toUpperCase()}_USERNAME`] = values.username;
    process.env[`DB_${env.toUpperCase()}_DBNAME`] = values.dbname;
    process.env[`DB_${env.toUpperCase()}_ENDPOINT`] = values.endpoint;
    process.env[`DB_${env.toUpperCase()}_SECRET`] = values.secret;
};
const getWarning = ({ toHost, toDBName, toPort, toUsername }) => `
For your convenience:

Prisma production URL: https://dashboard.heroku.com/apps/monsoon-prisma-production
Prisma staging URL: https://dashboard.heroku.com/apps/monsoon-prisma-staging

Prisma Production DB Credentials: https://data.heroku.com/datastores/678b494b-b22a-4623-b8be-cdd4af0b73aa#credentials
Prisma Staging DB Credentials: https://data.heroku.com/datastores/22766167-0a92-40df-9949-6c9733728e93#administration

DANGER ALERT. Please review the change you are about to make.

Source DB:
-- Host: ${process.env.DB_PRODUCTION_HOST}
-- Port: ${process.env.DB_PRODUCTION_PORT}
-- DBname: ${process.env.DB_PRODUCTION_DBNAME}
-- Username: ${process.env.DB_PRODUCTION_USERNAME}

Destination DB:
-- Host: ${toHost}
-- Port: ${toPort}
-- DBName: ${toDBName}
-- Username: ${toUsername}

All data on the destination DB will be irreversibly (unless you have a backup)
replaced with the data from source.

Proceed?`;
const getExecSyncWithOptions = options => {
    return (cmd) => {
        child_process_1.execSync(cmd, options);
    };
};
//# sourceMappingURL=syncPrisma.js.map