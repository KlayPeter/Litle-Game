# 素材调研与使用说明

## 选定的视觉方向：余烬纸牌

- **底色**：深森林绿 + 炭黑 + 暖橙火光。
- **主体**：白色线框图标，像旧桌游/生存手册里的标记。
- **卡牌**：深色卡面 + 类型色边（人=绿、建筑=蓝、道具=金、电台=紫）。
- **氛围**：营地、火堆、雪夜、手写日志；不依赖 3D/大图。

为什么选它：

1. **统一**：一套图标风格一致，不会出现“这里像素、那里厚涂”的割裂。
2. **可商用**：Kenney 素材是 CC0，省掉授权风险。
3. **小**：64px PNG，几十 KB，加载快，适合 Web 和以后上微信小游戏。
4. **可扩展**：新卡牌只要加一个图标 + 数据，不用重画整套 UI。
5. **不撞脸**：不是二次元、不是仙侠、不是常见“末日写实”，更像桌游。

## 用了哪些素材

### 1. Kenney · Board Game Icons

- 来源：[https://kenney.nl/assets/board-game-icons](https://kenney.nl/assets/board-game-icons)
- 许可证：**CC0 1.0**（公共领域，可商用，无需署名；保留 credits 更礼貌）
- 用途：所有卡牌图标、资源图标、夜晚/防御/零件图标。
- 已复制到：`assets/icons/`
- 许可文件：`assets/licenses/kenney-board-game-icons-license.txt`

### 2. Kenney · Board Game Pack（音频）

- 来源：[https://kenney.nl/assets/boardgame-pack](https://kenney.nl/assets/boardgame-pack)
- 许可证：**CC0 1.0**
- 用途：打牌、合成、抽牌、夜袭的短音效。
- 已复制到：`assets/audio/`
- 许可文件：`assets/licenses/kenney-board-game-pack-license.txt`

## 图标映射

| 游戏内 | 文件 | 说明 |
|---|---|---|
| 幸存者 | `character.png` | 通用人形 |
| 拾荒者 | `pouch.png` | 袋子 |
| 工程师 | `resource_planks.png` | 木板/工具 |
| 医生 | `flask_full.png` | 药瓶 |
| 猎人 | `bow.png` | 弓 |
| 厨师 | `resource_wheat.png` | 麦穗 |
| 守卫 | `shield.png` | 盾 |
| 篝火 | `campfire.png` | 火堆 |
| 木墙 | `structure_wall.png` | 城墙 |
| 哨塔 | `structure_tower.png` | 塔 |
| 庇护所 | `structure_house.png` | 房子 |
| 农场 | `structure_farm.png` | 农田 |
| 集水器 | `flask_full.png` | 容器（复用） |
| 工作台 | `resource_planks.png` | 木板（复用） |
| 猎弓 | `bow.png` | 弓 |
| 陷阱 | `spinner.png` | 机关 |
| 电台 | `structure_watchtower.png` | 塔/天线 |
| 堡垒 | `structure_gate.png` | 城门 |
| 温室 | `structure_farm.png` | 农田（复用） |`r`n| 尖刺墙 | `structure_wall.png` | 城墙（复用） |`r`n| 家园 | `structure_house.png` | 房子（复用） |`r`n| 瞭望塔 | `structure_tower.png` | 塔（复用） |
| 食物 | `resource_apple.png` | 苹果 |
| 木头 | `resource_wood.png` | 原木 |
| 金属 | `resource_iron.png` | 金属 |
| 药品 | `flask_full.png` | 药瓶 |
| 电台零件 | `puzzle.png` | 拼图块 |
| 夜袭 | `skull.png` | 骷髅 |
| 防御 | `shield.png` | 盾 |
| 行动点 | `hourglass.png` | 沙漏 |`r`n| 研究 | `book_open.png` | 书 |

## 没有用的素材（以及为什么）

| 类型 | 为什么不用 |
|---|---|
| AI 生成的“末日卡牌”套图 | 风格容易不统一，授权条款要看工具；卡牌 UI 需要精确尺寸，AI 图不好裁 |
| OpenGameArt 混合包 | 很多是 CC-BY-SA/GPL，商用/闭源要逐张核对，容易踩坑 |
| GitHub 上无 LICENSE 的“小游戏源码”素材 | 代码许可不覆盖素材；默认保留所有权利 |
| 带 IP 的素材（红警/羊了个羊/跳一跳等） | 侵权风险，不能商用 |
| 照片/电影截图 | 版权/肖像权风险 |
| 大量 3D/写实渲染 | 包体大、风格难统一、Web 加载慢 |

## 怎么替换成自己的素材

1. 保持 **64×64 或 128×128 透明 PNG**，白色/浅色线稿最稳。
2. 文件名对应 `game.js` 里的 `CARD[type].icon`。
3. 卡牌框、颜色、布局都是 CSS，不需要重做 UI。
4. 如果要换整套风格，先改 `style.css` 里的 `--accent` 和卡面渐变，再替换图标。
5. 商业发布前保留 `assets/licenses/` 和本文件。

## 素材包体积

当前 `assets/` 约 **100 KB 左右**（图标 + 4 个音效），不会拖慢 Web 加载；上微信小游戏也远小于 4MB 主包限制。

## 备注

- 游戏内没有外部字体，全部使用系统字体，避免字体授权问题。
- 背景、卡牌纹理、火光、雪都是 CSS，不额外加载大图。
- 如果以后要加角色立绘/剧情插画，建议先定“余烬纸牌”的色板和线宽，再找画师，避免风格漂移。

