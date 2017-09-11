declare module "gulp-print" {
    const print: (format: (filePath: string) => string) => NodeJS.ReadWriteStream;
    export = print;
}