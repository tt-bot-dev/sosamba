class SosambaBase {
    constructor(sosamba, fileName = __filename, filePath = __dirname) {
        this.sosamba = sosamba;
        this.file = fileName;
        this.path = filePath;
    }
}

module.exports = SosambaBase;