import * as fs from "fs";
import * as rimraf from "rimraf";
import * as vinylfs from "vinyl-fs";
import ftp = require("vinyl-ftp");

export interface ISecureOptions {
    /**
     * Set false for self-signed or expired secure FTP connections.
     */
    rejectUnauthorized: boolean;
}

export interface IFtpConfiguration {
    /**
     * FTP host
     * @default localhost
     */
    host?: string;

    /**
     * FTP user
     * @default anonymous
     */
    user?: string;

    /**
     * FTP password
     * @default anonymous@
     */
    password?: string;

    /**
     * FTP port
     * @default 21
     */
    port?: number;

    /**
     * Log function
     * @default null
     */
    log?: (message?: any, ...optionalParams: any[]) => void;

    /**
     * Offset server time by this number of minutes
     * @default 0
     */
    timeOffset?: number;
    /**
     * Number of parallel transfers
     * @default 3
     */
    parallel?: number;

    /**
     * Maximum number of connections, should be greater or equal to "parallel".
     * Default is 5, or the parallel setting.
     * Don't worry about setting this too high, vinyl-ftp recovers from "Too many connections" errors nicely.
     * @default 5
     */
    maxConnections?: number;

    /**
     * Clear caches before (each) stream
     * @default false
     */
    reload?: boolean;

    /**
     * Time to keep idle FTP connections (milliseconds)
     * @default 100
     */
    idleTimeout?: number;

    /**
     * A debug callback that gets extensive debug information
     * @default null
     */
    debug?: (...params: any[]) => void;

    /**
     * Set true for secured FTP connections
     * @default false
     */
    secure?: boolean;

    /**
     * Security Options
     */
    secureOptions?: ISecureOptions;
}

export type Glob = string | string[];
export type TestFunction = () => any;

function trimTrailingSlashes(input: string) {
    while (input.endsWith("/")) {
        input = input.substr(0, input.length - 1);
    }
    return input;
}

export default class FtpDeployment {
    private testConnection: ftp;
    private prodConnection: ftp;

    private targetFolder: string;
    private backupDir: string;

    private deploymentFiles: NodeJS.ReadWriteStream;
    /**
     *
     * @param testFtpConfiguration
     * @param prodFtpConfiguration
     * @param deploymentFiles gulp.src(glob, { base: ".", buffer: false })
     * @param targetFolder @default "/site/wwwroot"
     * @param backupDir @default "./backup"
     */
    constructor(testFtpConfiguration: IFtpConfiguration, prodFtpConfiguration: IFtpConfiguration,
        deploymentFiles: NodeJS.ReadWriteStream,
        targetFolder: string = "/site/wwwroot", backupDir: string = "./backup") {
        this.backupDir = backupDir;
        this.targetFolder = trimTrailingSlashes(targetFolder);
        this.testConnection = ftp.create(testFtpConfiguration);
        this.prodConnection = ftp.create(prodFtpConfiguration);
        this.deploymentFiles = deploymentFiles;
    }

    /**
     *
     * @param tests An array of test functions that should return an error if the test fails.
     */
    public async deploy(tests?: TestFunction[]) {
        await this.backupDeployTest(this.testConnection, tests);
        await this.backupDeployTest(this.prodConnection, tests);
    }

    private async backupDeployTest(conn: ftp, tests?: TestFunction[]) {
        await this.backup(conn);
        try {
            await this.deploySource(conn, this.deploymentFiles);
            if (tests) {
                const errors = tests.map((testFunction) => testFunction());
                if (errors.length > 0) {
                    throw errors;
                }
            }
        } catch (e) {
            // Rollback
            try {
                await this.deploySource(conn, vinylfs.src(this.backupDir));
                await this.clearBackup();
                // tslint:disable-next-line:no-empty
            } catch (ee) { }
            throw e;
        }
        await this.clearBackup();
    }

    private async clearBackup() {
        return new Promise((resolve, reject) => {
            fs.exists(this.backupDir, (exists) => {
                if (!exists) {
                    resolve();
                    return;
                }
                rimraf(this.backupDir, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        });
    }

    private async backup(conn: ftp) {
        await this.clearBackup();
        return new Promise(async (resolve, reject) => {
            fs.mkdir(this.backupDir, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                conn.src(`${this.targetFolder}/**/*`)
                    .pipe(vinylfs.dest(this.backupDir))
                    .on("end", resolve)
                    .on("error", (...args) => { reject(args); });
            });
        });
    }

    private async deploySource(conn: ftp, source: NodeJS.ReadWriteStream) {
        return new Promise((resolve, reject) => {
            conn.rmdir(this.targetFolder, (e) => {
                if (e && (!e.message || e.message !== "The system cannot find the file specified.")) {
                    reject(e);
                    return;
                }
                source
                    .pipe(conn.dest(this.targetFolder))
                    .on("end", resolve)
                    .on("error", (...args) => { reject(args); });
            });
        });
    }
}

const azureFuncSrcGlob = ["./host.json", "./!(node_modules|backup)/!(*.ts)"];

export function getConfiguration(environment: string): IFtpConfiguration {
    const port = process.env[`ftp_port_${environment}`];
    const secure = process.env[`ftp_secure_${environment}`];
    return {
        host: process.env[`ftp_host_${environment}`],
        user: process.env[`ftp_user_${environment}`],
        password: process.env[`ftp_password_${environment}`],
        port: port && /^[\d]{1-5}$/.test(port) ? parseInt(port, 10) : 21,
        secure: secure && /^(false|0)$/.test(secure) ? false : true
    };
}

const deployment = new FtpDeployment(getConfiguration("test"), getConfiguration("prod"),
    vinylfs.src(azureFuncSrcGlob, { base: ".", buffer: false }));
// const tests = [() => new Error("fhaksjdhjk")];
deployment.deploy();
