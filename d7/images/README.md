# NFT 图片目录

## 📸 放置你的 NFT 图片

请将你的 NFT 图片文件放在这个目录中。

### 文件命名规则

图片文件名应该与对应的元数据 JSON 文件匹配:

```
1.png  -> 对应 metadata/1.json
2.png  -> 对应 metadata/2.json
3.png  -> 对应 metadata/3.json
```

### 支持的图片格式

- ✅ PNG (.png) - 推荐,支持透明背景
- ✅ JPEG (.jpg, .jpeg) - 文件较小
- ✅ GIF (.gif) - 支持动画
- ✅ SVG (.svg) - 矢量图形

### 图片要求

**尺寸:**
- 推荐: 1000x1000 像素或更大
- 最小: 500x500 像素
- 纵横比: 1:1 (正方形) 最佳

**文件大小:**
- 推荐: < 10 MB
- 最大: < 100 MB

**质量:**
- 高分辨率
- 清晰锐利
- 适合在小尺寸下显示

## 🎨 创建 NFT 图片

### 方法 1: 手工创作

使用专业设计工具:
- **Adobe Photoshop** - 专业图像编辑
- **GIMP** - 免费替代品
- **Procreate** - iPad 绘画应用
- **Krita** - 免费数字绘画软件

### 方法 2: AI 生成

使用 AI 工具快速生成:

**Midjourney (推荐)**
```
/imagine prompt: cute cartoon cat with sunglasses, vibrant colors,
digital art, clean background, 1:1 aspect ratio
```

**DALL-E 3**
- 访问: https://labs.openai.com/
- 输入提示词生成图片

**Stable Diffusion**
```
Prompt: cool digital art cat character, wearing sunglasses,
colorful, high quality, square format
Negative prompt: blurry, low quality, distorted
```

**Leonardo.ai (免费)**
- 访问: https://leonardo.ai/
- 每天免费生成 150 张图片

### 方法 3: 使用现有图片

确保你拥有使用权限:
- 自己拍摄的照片 ✅
- 购买的图库照片 ✅
- CC0 许可的图片 ✅
- 他人作品(未授权) ❌

**免费图库网站:**
- [Unsplash](https://unsplash.com/) - 高质量照片
- [Pexels](https://pexels.com/) - 免费图片和视频
- [Pixabay](https://pixabay.com/) - 免费图片

## 🖼️ 示例提示词

### 可爱动物系列

```
Midjourney/DALL-E Prompt:
"cute [animal] character, wearing [accessory], [color] theme,
digital art, clean white background, kawaii style, 1:1 ratio"

例如:
- cute cat character, wearing sunglasses, orange theme, digital art
- cool dog character, wearing hat, brown theme, digital art
- adorable bird character, wearing crown, blue theme, digital art
```

### 像素艺术风格

```
"pixel art [subject], 8-bit style, vibrant colors,
game asset, transparent background"
```

### 抽象艺术

```
"abstract [theme], colorful, modern art, geometric shapes,
high quality, wallpaper, 1:1 aspect ratio"
```

### 3D 渲染

```
"3D render of [object], colorful, studio lighting,
clean background, high detail, professional"
```

## 📝 准备流程

### 1. 创建或获取图片

- 设计你的图片
- 确保符合尺寸要求
- 保存为支持的格式

### 2. 优化图片

```bash
# 使用 ImageMagick 调整大小
magick convert input.png -resize 1000x1000 output.png

# 压缩 PNG
pngquant --quality=80-100 input.png -o output.png
```

### 3. 命名文件

按照编号命名:
```
1.png
2.png
3.png
...
```

### 4. 放入此目录

将所有图片文件复制到这个目录。

## ✅ 检查清单

上传到 IPFS 前,确认:

- [ ] 所有图片文件都在此目录
- [ ] 文件名与元数据 JSON 匹配
- [ ] 图片格式正确 (PNG/JPG/GIF/SVG)
- [ ] 图片尺寸合适 (推荐 1000x1000)
- [ ] 文件大小合理 (< 10MB)
- [ ] 图片质量良好,清晰可见
- [ ] 拥有图片的使用权限

## 🚀 下一步

图片准备好后:

1. 编辑 `metadata/` 目录中的 JSON 文件
2. 运行上传脚本: `npm run upload-ipfs`
3. 脚本会自动上传图片并更新元数据

---

**注意:** 这个目录中的示例文件仅用于演示。请替换为你自己的 NFT 图片!
