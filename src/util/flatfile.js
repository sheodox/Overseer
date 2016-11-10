import fs from 'fs';

class FlatFile {
    constructor(filePath, fallbackVal) {
        this.filePath = filePath;
        this.savePromise = Promise.resolve();

        try {
            this.data = JSON.parse(fs.readFileSync(filePath));
        }catch (e) {
            this.data = fallbackVal;
        }
    }
    save() {
        this.savePromise = this.savePromise.then(() => {
            return new Promise((resolve, reject) => {
                fs.writeFile(this.filePath, JSON.stringify(this.data, null, 4), (err) => {
                    err ? reject(err) : resolve();
                })
            })
        })
    }
}

export default FlatFile;
