import crypto from "crypto"

const ENCRYPTION_KEY = process.env.FILE_ENCRYPTION_KEY || crypto.randomBytes(32)
const IV_LENGTH = 16

export function encryptFile(buffer: Buffer): { encryptedData: Buffer; iv: Buffer } {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipher("aes-256-cbc", ENCRYPTION_KEY)
  cipher.setAutoPadding(true)

  const encryptedData = Buffer.concat([cipher.update(buffer), cipher.final()])

  return { encryptedData, iv }
}

export function decryptFile(encryptedData: Buffer, iv: Buffer): Buffer {
  const decipher = crypto.createDecipher("aes-256-cbc", ENCRYPTION_KEY)
  decipher.setAutoPadding(true)

  return Buffer.concat([decipher.update(encryptedData), decipher.final()])
}

export function generateSecureFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = crypto.randomBytes(8).toString("hex")
  const extension = originalName.split(".").pop()
  return `${timestamp}-${random}.${extension}.enc`
}
