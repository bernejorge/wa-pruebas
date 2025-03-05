import crypto from "crypto";
import dotenv from "dotenv";

// Carga las variables de entorno del archivo .env
dotenv.config();

// Clave pública proporcionada
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtIYcRg4dqt4LesqqJW8D
VtgLVG1PRJ8pIqHNpJPaL89AZvGx9QORQoK1j81YldHeOb/AGk3j1G/3wCP3oUMh
T76g0DKOnEOmwzaDdM7dehwx1ZY4JFpgCAguPOxBP8XuzPBPM4W/HfK6z9Q7NY0M
L5i9Hs7UyBkRNtP4Q4IicPBn4jul4BAI6bS2QST4KW/fBCUBRoCPFHMyuX+hNkj9
yOReGr6eAC6OdHQU+dKFa4euIbWT+PXq2BFz/cVjrrFB08mWafhsyEZOaLo4YObo
/XITr2IPCu2TUXXa7mDrzdlL6ImQtX8mUFpQTk6gZmy736Bb1Hjwwb1uFTJ+mNQ+
NwIDAQAB
-----END PUBLIC KEY-----`;

// Recupera la clave privada y el passphrase desde las variables de entorno
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PASSPHRASE = process.env.PASSPHRASE || "";

if (!PRIVATE_KEY) {
  console.error("La variable de entorno PRIVATE_KEY no está definida. Verifica tu archivo .env.");
  process.exit(1);
}

// Mensaje que vamos a encriptar y luego desencriptar
const mensajeOriginal = "Mensaje secreto para probar la desencriptación";

// Encriptamos el mensaje usando la clave pública
const mensajeEncriptado = crypto.publicEncrypt(
  PUBLIC_KEY,
  Buffer.from(mensajeOriginal, "utf8")
);
console.log("Mensaje encriptado (base64):", mensajeEncriptado.toString("base64"));

// Desencriptamos el mensaje usando la clave privada
try {
  const mensajeDesencriptado = crypto.privateDecrypt(
    {
      key: PRIVATE_KEY,
      passphrase: PASSPHRASE,
    },
    mensajeEncriptado
  );
  console.log("Mensaje desencriptado:", mensajeDesencriptado.toString("utf8"));
} catch (error) {
  console.error("Error al desencriptar el mensaje:", error);
}
