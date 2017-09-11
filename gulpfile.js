"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs = require("fs");
var rimraf = require("rimraf");
var vinylfs = require("vinyl-fs");
var ftp = require("vinyl-ftp");
function trimTrailingSlashes(input) {
    while (input.endsWith("/")) {
        input = input.substr(0, input.length - 1);
    }
    return input;
}
var FtpDeployment = (function () {
    /**
     *
     * @param testFtpConfiguration
     * @param prodFtpConfiguration
     * @param deploymentFiles gulp.src(glob, { base: ".", buffer: false })
     * @param targetFolder @default "/site/wwwroot"
     * @param backupDir @default "./backup"
     */
    function FtpDeployment(testFtpConfiguration, prodFtpConfiguration, deploymentFiles, targetFolder, backupDir) {
        if (targetFolder === void 0) { targetFolder = "/site/wwwroot"; }
        if (backupDir === void 0) { backupDir = "./backup"; }
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
    FtpDeployment.prototype.deploy = function (tests) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.backupDeployTest(this.testConnection, tests)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.backupDeployTest(this.prodConnection, tests)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FtpDeployment.prototype.backupDeployTest = function (conn, tests) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, e_1, ee_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.backup(conn)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 10]);
                        return [4 /*yield*/, this.deploySource(conn, this.deploymentFiles)];
                    case 3:
                        _a.sent();
                        if (tests) {
                            errors = tests.map(function (testFunction) { return testFunction(); });
                            if (errors.length > 0) {
                                throw errors;
                            }
                        }
                        return [3 /*break*/, 10];
                    case 4:
                        e_1 = _a.sent();
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 8, , 9]);
                        return [4 /*yield*/, this.deploySource(conn, vinylfs.src(this.backupDir))];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.clearBackup()];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        ee_1 = _a.sent();
                        return [3 /*break*/, 9];
                    case 9: throw e_1;
                    case 10: return [4 /*yield*/, this.clearBackup()];
                    case 11:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FtpDeployment.prototype.clearBackup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        fs.exists(_this.backupDir, function (exists) {
                            if (!exists) {
                                resolve();
                                return;
                            }
                            rimraf(_this.backupDir, function (err) {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                resolve();
                            });
                        });
                    })];
            });
        });
    };
    FtpDeployment.prototype.backup = function (conn) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.clearBackup()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_a) {
                                    fs.mkdir(this.backupDir, function (err) {
                                        if (err) {
                                            reject(err);
                                            return;
                                        }
                                        conn.src(_this.targetFolder + "/**/*")
                                            .pipe(vinylfs.dest(_this.backupDir))
                                            .on("end", resolve)
                                            .on("error", function () {
                                            var args = [];
                                            for (var _i = 0; _i < arguments.length; _i++) {
                                                args[_i] = arguments[_i];
                                            }
                                            reject(args);
                                        });
                                    });
                                    return [2 /*return*/];
                                });
                            }); })];
                }
            });
        });
    };
    FtpDeployment.prototype.deploySource = function (conn, source) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        conn.rmdir(_this.targetFolder, function (e) {
                            if (e && (!e.message || e.message !== "The system cannot find the file specified.")) {
                                reject(e);
                                return;
                            }
                            source
                                .pipe(conn.dest(_this.targetFolder))
                                .on("end", resolve)
                                .on("error", function () {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                reject(args);
                            });
                        });
                    })];
            });
        });
    };
    return FtpDeployment;
}());
exports["default"] = FtpDeployment;
var azureFuncSrcGlob = ["./host.json", "./!(node_modules|backup)/!(*.ts)"];
function getConfiguration(environment) {
    var port = process.env["ftp_port_" + environment];
    return {
        host: process.env["ftp_host_" + environment] || "waws-prod-am2-049.ftp.azurewebsites.windows.net",
        password: process.env["ftp_password_" + environment]
            || "A2FGGCrTYlbw71jNp4uyddW8sQcjq8qmXduhmfhGgYv3rDPirCAwM2DeF5SM",
        port: port ? parseInt(port, 10) : 21,
        user: process.env["ftp_user_" + environment] || "abnodefuncapp\\$abnodefuncapp",
        secure: true
    };
}
exports.getConfiguration = getConfiguration;
var deployment = new FtpDeployment(getConfiguration("test"), getConfiguration("prod"), vinylfs.src(azureFuncSrcGlob, { base: ".", buffer: false }));
// const tests = [() => new Error("fhaksjdhjk")];
deployment.deploy();
//# sourceMappingURL=gulpfile.js.map