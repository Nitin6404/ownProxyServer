const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Create the certs directory if it doesn't exist
const certsDir = path.join(__dirname, '..', 'config/certificates');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

console.log('Generating CA certificate...');

// Generate CA key pair
const caKeys = forge.pki.rsa.generateKeyPair(2048);
const caCert = forge.pki.createCertificate();
caCert.publicKey = caKeys.publicKey;
caCert.serialNumber = '01';
caCert.validity.notBefore = new Date();
caCert.validity.notAfter = new Date();
caCert.validity.notAfter.setFullYear(caCert.validity.notBefore.getFullYear() + 1);

const caAttrs = [
  { name: 'commonName', value: 'Custom Local CA' },
  { name: 'countryName', value: 'US' },
  { shortName: 'ST', value: 'Private' },
  { name: 'localityName', value: 'Local' },
  { name: 'organizationName', value: 'Development CA' },
  { shortName: 'OU', value: 'Development' }
];

caCert.setSubject(caAttrs);
caCert.setIssuer(caAttrs);
caCert.setExtensions([
  { name: 'basicConstraints', cA: true },
  { name: 'keyUsage', keyCertSign: true, cRLSign: true, digitalSignature: true }
]);

// Self-sign the CA certificate
caCert.sign(caKeys.privateKey, forge.md.sha256.create());

// Save CA certificate and key
const caPem = forge.pki.certificateToPem(caCert);
const caKeyPem = forge.pki.privateKeyToPem(caKeys.privateKey);

fs.writeFileSync(path.join(certsDir, 'ca.crt'), caPem);
fs.writeFileSync(path.join(certsDir, 'ca.key'), caKeyPem);

console.log('Generating server certificate...');

// Generate server key pair
const serverKeys = forge.pki.rsa.generateKeyPair(2048);
const serverCert = forge.pki.createCertificate();
serverCert.publicKey = serverKeys.publicKey;
serverCert.serialNumber = '02';
serverCert.validity.notBefore = new Date();
serverCert.validity.notAfter = new Date();
serverCert.validity.notAfter.setFullYear(serverCert.validity.notBefore.getFullYear() + 1);

const serverAttrs = [
  { name: 'commonName', value: 'localhost' },
  { name: 'countryName', value: 'US' },
  { shortName: 'ST', value: 'Private' },
  { name: 'localityName', value: 'Local' },
  { name: 'organizationName', value: 'Development' },
  { shortName: 'OU', value: 'Development' }
];

serverCert.setSubject(serverAttrs);
serverCert.setIssuer(caAttrs);
serverCert.setExtensions([
  { name: 'basicConstraints', cA: false },
  { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
  { name: 'extKeyUsage', serverAuth: true },
  { name: 'subjectAltName', altNames: [
    { type: 2, value: 'localhost' },
    { type: 7, ip: '127.0.0.1' },
    { type: 7, ip: '::1' }
  ]}
]);

// Sign the server certificate with the CA key
serverCert.sign(caKeys.privateKey, forge.md.sha256.create());

// Save server certificate and key
const serverPem = forge.pki.certificateToPem(serverCert);
const serverKeyPem = forge.pki.privateKeyToPem(serverKeys.privateKey);

fs.writeFileSync(path.join(certsDir, 'server.crt'), serverPem);
fs.writeFileSync(path.join(certsDir, 'server.key'), serverKeyPem);

console.log('Certificates generated successfully!');
console.log(`Certificate files saved to: ${certsDir}`);
console.log('To use these certificates in a browser, you may need to import the CA certificate (ca.crt) into your browser\'s trusted roots.');