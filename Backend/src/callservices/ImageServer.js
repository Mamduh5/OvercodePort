const { Client } = require('ssh2');
const fs = require('fs');
const config = require('config');
const serviceImage = config.get('serviceImage');

const createRemoteDir = (sftp, dirPath, conn) => {
    return new Promise((resolve, reject) => {
        sftp.stat(dirPath, (err, stats) => {
            if (err && err.code === 2) {
                sftp.mkdir(dirPath, { recursive: true }, (err) => {
                    if (err) {
                        conn.end();
                        return resolve(false);
                    }
                    resolve(true);
                });
            } else if (stats && typeof stats.isDirectory === 'function' && stats.isDirectory()) {
                resolve(true);
            } else {
                conn.end();
                resolve(false);
            }
        });
    });
};

const uploadFile = (sftp, localFilePath, remoteFilePath, conn) => {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(localFilePath);
        const writeStream = sftp.createWriteStream(remoteFilePath);

        writeStream.on('error', () => {
            conn.end();
            resolve(false);
        });

        writeStream.on('close', () => {
            conn.end();
            resolve(true);
        });

        readStream.pipe(writeStream);
    });
};

const downloadFileAsBuffer = (sftp, remoteFilePath, conn) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const readStream = sftp.createReadStream(remoteFilePath);

        readStream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        readStream.on('end', () => {
            const fileBuffer = Buffer.concat(chunks);
            conn.end();
            resolve(fileBuffer);
        });

        readStream.on('error', () => {
            conn.end();
            resolve(false);
        });
    });
};

const connectToSftp = (remoteFilePath, callback) => {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
            const realRemoteFilePath = `${serviceImage.path}/${remoteFilePath}`;
            conn.sftp(async (err, sftp) => {
                if (err) {
                    conn.end();
                    return resolve(err);
                }
                try {
                    await callback(sftp, realRemoteFilePath, conn, resolve, reject);
                } catch (error) {
                    conn.end();
                    resolve(error);
                }
            });
        }).connect({
            host: serviceImage.host,
            port: serviceImage.port,
            username: serviceImage.username,
            password: serviceImage.password
        });
    });
};

const uploadFileToServer = async (localFilePath, createPath, remoteFilePath) => {
    return connectToSftp(remoteFilePath, async (sftp, realRemoteFilePath, conn, resolve, reject) => {
        const realRemoteDirPath = `${serviceImage.path}/${createPath}`;
        try {
            await createRemoteDir(sftp, realRemoteDirPath, conn);
            const result = await uploadFile(sftp, localFilePath, realRemoteFilePath, conn);
            resolve(result);
        } catch {
            conn.end();
            reject(false);
        }
    });
};

const downloadFileAsBufferFromServer = async (remoteFilePath) => {
    return connectToSftp(remoteFilePath, async (sftp, realRemoteFilePath, conn, resolve) => {
        sftp.stat(realRemoteFilePath, async (err) => {
            if (err) {
                conn.end();
                return resolve(false);
            }
            const result = await downloadFileAsBuffer(sftp, realRemoteFilePath, conn);
            resolve(result);
        });
    });
};

module.exports = { uploadFileToServer, downloadFileAsBufferFromServer };
