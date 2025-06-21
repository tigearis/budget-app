import crypto from "crypto"

const ENCRYPTION_ALGORITHM = "aes-256-gcm"
const KEY_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16

export class EncryptionService {
  private static instance: EncryptionService
  private masterKey: Buffer

  private constructor() {
    this.masterKey = this.getMasterKey()
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService()
    }
    return EncryptionService.instance
  }

  private getMasterKey(): Buffer {
    const key = process.env.MASTER_ENCRYPTION_KEY
    if (!key) {
      throw new Error("MASTER_ENCRYPTION_KEY environment variable is required")
    }
    return Buffer.from(key, "hex")
  }

  public generateDataKey(): Buffer {
    return crypto.randomBytes(KEY_LENGTH)
  }

  public encryptData(data: string | Buffer, dataKey?: Buffer): EncryptedData {
    const key = dataKey || this.masterKey
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, key)
    cipher.setAAD(Buffer.from("financial-data"))

    let encrypted = cipher.update(data, "utf8", "hex")
    encrypted += cipher.final("hex")
    const tag = cipher.getAuthTag()

    return {
      data: encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
      algorithm: ENCRYPTION_ALGORITHM,
    }
  }

  public decryptData(encryptedData: EncryptedData, dataKey?: Buffer): string {
    const key = dataKey || this.masterKey
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, key)

    decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"))
    decipher.setAAD(Buffer.from("financial-data"))

    let decrypted = decipher.update(encryptedData.data, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  }

  public encryptFile(filePath: string, outputPath: string, dataKey?: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const key = dataKey || this.masterKey
      const iv = crypto.randomBytes(IV_LENGTH)
      const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, key)

      const input = require("fs").createReadStream(filePath)
      const output = require("fs").createWriteStream(outputPath)

      input.pipe(cipher).pipe(output)

      output.on("finish", () => resolve())
      output.on("error", reject)
    })
  }

  public hashPassword(password: string, salt?: string): HashedPassword {
    const saltBuffer = salt ? Buffer.from(salt, "hex") : crypto.randomBytes(32)
    const hash = crypto.pbkdf2Sync(password, saltBuffer, 100000, 64, "sha512")

    return {
      hash: hash.toString("hex"),
      salt: saltBuffer.toString("hex"),
      iterations: 100000,
      algorithm: "pbkdf2",
    }
  }

  public verifyPassword(password: string, hashedPassword: HashedPassword): boolean {
    const hash = crypto.pbkdf2Sync(
      password,
      Buffer.from(hashedPassword.salt, "hex"),
      hashedPassword.iterations,
      64,
      "sha512",
    )

    return crypto.timingSafeEqual(Buffer.from(hashedPassword.hash, "hex"), hash)
  }

  public generateSecureToken(length = 32): string {
    return crypto.randomBytes(length).toString("hex")
  }

  public createChecksum(data: string | Buffer): string {
    return crypto.createHash("sha256").update(data).digest("hex")
  }
}

export interface EncryptedData {
  data: string
  iv: string
  tag: string
  algorithm: string
}

export interface HashedPassword {
  hash: string
  salt: string
  iterations: number
  algorithm: string
}

// Field-level encryption for sensitive data
export class FieldEncryption {
  private static encryptionService = EncryptionService.getInstance()

  public static encryptField(value: any, fieldName: string): string {
    if (value === null || value === undefined) return value

    const dataToEncrypt = JSON.stringify({ field: fieldName, value })
    const encrypted = this.encryptionService.encryptData(dataToEncrypt)

    return JSON.stringify(encrypted)
  }

  public static decryptField(encryptedValue: string): any {
    if (!encryptedValue) return null

    try {
      const encryptedData = JSON.parse(encryptedValue)
      const decrypted = this.encryptionService.decryptData(encryptedData)
      const parsed = JSON.parse(decrypted)

      return parsed.value
    } catch (error) {
      console.error("Failed to decrypt field:", error)
      return null
    }
  }
}

// Database encryption middleware
export function encryptSensitiveFields(data: Record<string, any>, sensitiveFields: string[]): Record<string, any> {
  const encrypted = { ...data }

  for (const field of sensitiveFields) {
    if (encrypted[field] !== undefined) {
      encrypted[field] = FieldEncryption.encryptField(encrypted[field], field)
    }
  }

  return encrypted
}

export function decryptSensitiveFields(data: Record<string, any>, sensitiveFields: string[]): Record<string, any> {
  const decrypted = { ...data }

  for (const field of sensitiveFields) {
    if (decrypted[field] !== undefined) {
      decrypted[field] = FieldEncryption.decryptField(decrypted[field])
    }
  }

  return decrypted
}
