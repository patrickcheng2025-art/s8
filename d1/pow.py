import hashlib
import time

def find_hash_with_prefix(nickname, prefix):
    nonce = 0
    start_time = time.time()

    while True:
        # 构建要哈希的内容
        content = f"{nickname}{nonce}"
        # 计算SHA256哈希
        hash_value = hashlib.sha256(content.encode()).hexdigest()

        # 检查是否满足前缀条件
        if hash_value.startswith(prefix):
            end_time = time.time()
            elapsed_time = end_time - start_time
            return nonce, content, hash_value, elapsed_time

        nonce += 1

if __name__ == "__main__":
    # 设置你的昵称
    nickname = "Patrick"

    # 寻找4个0开头的哈希
    print("开始寻找以4个0开头的哈希值...")
    nonce4, content4, hash4, time4 = find_hash_with_prefix(nickname, "0000")
    print(f"找到4个0开头的哈希值！")
    print(f"花费时间: {time4:.4f}秒")
    print(f"内容: {content4}")
    print(f"哈希值: {hash4}\n")

    # 寻找5个0开头的哈希
    print("开始寻找以5个0开头的哈希值...")
    nonce5, content5, hash5, time5 = find_hash_with_prefix(nickname, "00000")
    print(f"找到5个0开头的哈希值！")
    print(f"花费时间: {time5:.4f}秒")
    print(f"内容: {content5}")
    print(f"哈希值: {hash5}")