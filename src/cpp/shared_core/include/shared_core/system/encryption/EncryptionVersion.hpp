/*
 * EncryptionVersion.hpp
 *
 * Copyright (C) 2024 by Posit Software, PBC
 *
 * Unless you have received this program directly from Posit Software pursuant to the
 * terms of a commercial license agreement with Posit Software, then this program is
 * licensed to you under the following terms:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

#ifndef SHARED_CORE_SYSTEM_ENCRYPTION_VERSION_HPP
#define SHARED_CORE_SYSTEM_ENCRYPTION_VERSION_HPP

#include <vector>

namespace rstudio {
namespace core {

class Error;
class ErrorLocation;

} // namespace core
} // namespace rstudio

namespace rstudio {
namespace core {
namespace system {
namespace crypto {

/**
 * Encryption Versioning
 * ---------------------
 * 
 * Encryption versioning is used to transition to newer encryption algorithms 
 * without breaking compatibility with older versions of the software. For newly
 * encrypted data, the encryption version is stored in the first byte of the 
 * encrypted data buffer (or, there is no encryption version byte in the case of
 * version 0 "legacy" encryption).
 * 
 * The expectation is that these versioned encryption functions will not be called
 * directly by the software at large, but rather the interface through Crypto.hpp
 * will be used. The Crypto::aesDecrypt and Crypto::aesEncrypt functions will
 * determine which of the versioned functions in this file to use.
 * 
 * The versions and their corresponding encryption algorithms are as follows:
 * 
 * |Encryption Version | Encryption Used
 * |-------------------+------------------------------------------|
 * |     0  (legacy)   | AES 128 CBC, but with no version byte    |
 * |-------------------+------------------------------------------|
 * |     1             | AES 128 CBC (with version byte)          |
 * |-------------------+------------------------------------------|
 * |     2             | AES 256 GCM                              |
 * |--------------------------------------------------------------|
 * 
 */

namespace v0 {

/**
 * @brief Legacy AES 128 decrypts the specified data using the specified initialization vector.
 *
 * This function is the inverse of v0::aesEncrypt.
 *
 * @param in_data           The data to be decrypted.
 * @param in_key            The key with which to decrypt the data.
 * @param in_iv             The initialization vector that was used during encryption.
 * @param out_decrypted     The decrypted data.
 *
 * @return Success if the data could be AES 128 decrypted; Error otherwise.
 */
Error aesDecrypt(
   const std::vector<unsigned char>& in_data,
   const std::vector<unsigned char>& in_key,
   const std::vector<unsigned char>& in_iv,
   std::vector<unsigned char>& out_decrypted);

/**
 * @brief Legacy AES 128 encrypts the specified data using the specified initialization vector.
 *
 * This function is the inverse of v0::aesDecrypt.
 *
 * @param in_data           The data to be encrypted.
 * @param in_key            The key with which to encrypt the data.
 * @param in_iv             The initialization vector to use during encryption.
 * @param out_encrypted     The encrypted data.
 *
 * @return Success if the data could be AES 128 encrypted; Error otherwise.
 */
Error aesEncrypt(
   const std::vector<unsigned char>& in_data,
   const std::vector<unsigned char>& in_key,
   const std::vector<unsigned char>& in_iv,
   std::vector<unsigned char>& out_encrypted);

} // v0

namespace v1 {

/**
 * @brief AES 128 decrypts the specified v1 data using the specified initialization vector.
 *
 * This function is the inverse of v1::aesEncrypt.
 *
 * @param in_data           The v1 data to be decrypted.
 * @param in_key            The key with which to decrypt the v1 data.
 * @param in_iv             The initialization vector that was used during encryption.
 * @param out_decrypted     The decrypted data.
 *
 * @return Success if the data could be AES 128 decrypted; Error otherwise.
 */
Error aesDecrypt(
   const std::vector<unsigned char>& in_data,
   const std::vector<unsigned char>& in_key,
   const std::vector<unsigned char>& in_iv,
   std::vector<unsigned char>& out_decrypted);

/**
 * @brief AES 128 encrypts the specified v1 data using the specified initialization vector.
 *
 * This function is the inverse of v1::aesDecrypt.
 *
 * @param in_data           The v1 data to be encrypted.
 * @param in_key            The key with which to encrypt the v1 data.
 * @param in_iv             The initialization vector to use during encryption.
 * @param out_encrypted     The encrypted data.
 *
 * @return Success if the data could be AES 128 encrypted; Error otherwise.
 */
Error aesEncrypt(
   const std::vector<unsigned char>& in_data,
   const std::vector<unsigned char>& in_key,
   const std::vector<unsigned char>& in_iv,
   std::vector<unsigned char>& out_encrypted);

} // v1

namespace v2 {

/**
 * @brief AES 256 decrypts the specified v2 data using the specified initialization vector.
 *
 * This function is the inverse of v2::aesEncrypt.
 *
 * @param in_data           The v2 data to be decrypted.
 * @param in_key            The key with which to decrypt the v2 data.
 * @param in_iv             The initialization vector that was used during encryption.
 * @param in_aad            The accompanying Additional Authenticated Data, if any, for this encrypted data.
 * @param in_mac            The Message Authentication Code for this encrypted data.
 * @param out_decrypted     The decrypted data.
 *
 * @return Success if the data could be AES 256 decrypted; Error otherwise.
 */
Error aesDecrypt(
   const std::vector<unsigned char>& in_data,
   const std::vector<unsigned char>& in_key,
   const std::vector<unsigned char>& in_iv,
   const std::vector<unsigned char>& in_aad,
   std::vector<unsigned char>& in_mac,
   std::vector<unsigned char>& out_decrypted);

/**
 * @brief AES 256 encrypts the specified v2 data using the specified initialization vector.
 *
 * This function is the inverse of v2::aesDecrypt.
 *
 * @param data              The v2 data to be encrypted.
 * @param key               The key with which to encrypt the v2 data.
 * @param iv                The initialization vector to use during encryption.
 * @param aad               The (optional) Additional Authenticated Data to include.
 * @param out_mac           The resulting Message Authentication Code of the encrypted data.
 * @param out_encrypted     The encrypted data.
 *
 * @return Success if the data could be AES 256 encrypted; Error otherwise.
 */
Error aesEncrypt(
   const std::vector<unsigned char>& data,
   const std::vector<unsigned char>& key,
   const std::vector<unsigned char>& iv,
   const std::vector<unsigned char>& aad,
   std::vector<unsigned char>& out_mac,
   std::vector<unsigned char>& out_encrypted);

} // v2

} // crypto
} // system
} // core
} // rstudio

#endif // SHARED_CORE_SYSTEM_ENCRYPTION_VERSION_HPP
