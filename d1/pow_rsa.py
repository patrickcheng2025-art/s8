import rsa
import hashlib
import time

'''
实践非对称加密 RSA 
• 先生成一个公私钥对
• 用私钥对符合POW一个昵称 + nonce 进行私钥签名
• 用公钥验证
'''

# 生成RSA公私钥对
def generate_rsa_keys():
    # 生成2048位的RSA密钥对
    public_key, private_key = rsa.newkeys(2048)
    print("成功生成RSA公私钥对\n")
    return public_key, private_key


# 实现简单的POW，找到以4个0开头的哈希
def find_pow_nonce(nickname):
    print("开始进行POW计算，寻找以4个0开头的哈希值...")
    nonce = 0
    start_time = time.time()

    while True:
        content = f"{nickname}{nonce}"
        hash_value = hashlib.sha256(content.encode()).hexdigest()

        if hash_value.startswith("0000"):
            end_time = time.time()
            print(f"找到符合条件的nonce: {nonce}")
            print(f"POW内容: {content}")
            print(f"哈希值: {hash_value}")
            print(f"耗时: {end_time - start_time:.4f}秒\n")
            return content

        nonce += 1


# 使用私钥签名
def sign_with_private_key(private_key, data):
    # 对数据进行签名，使用SHA-256哈希算法
    signature = rsa.sign(data.encode(), private_key, 'SHA-256')
    print("使用私钥签名成功")
    return signature


# 使用公钥验证签名
def verify_with_public_key(public_key, data, signature):
    try:
        # 验证签名
        rsa.verify(data.encode(), signature, public_key)
        print("签名验证成功：数据未被篡改，且确实由对应私钥签名")
        return True
    except rsa.VerificationError:
        print("签名验证失败：数据可能被篡改，或签名私钥不匹配")
        return False


if __name__ == "__main__":
    # 设置昵称
    nickname = "Patrick"

    # 1. 生成RSA公私钥对
    public_key, private_key = generate_rsa_keys()

    # 2. 进行POW计算，获取符合条件的内容
    pow_content = find_pow_nonce(nickname)

    # 3. 使用私钥对POW结果进行签名
    signature = sign_with_private_key(private_key, pow_content)

    # 4. 使用公钥验证签名
    verify_with_public_key(public_key, pow_content, signature)

    # 演示验证失败的情况（篡改数据）
    print("\n测试数据被篡改的情况：")
    tampered_content = pow_content + "x"  # 篡改数据
    verify_with_public_key(public_key, tampered_content, signature)


