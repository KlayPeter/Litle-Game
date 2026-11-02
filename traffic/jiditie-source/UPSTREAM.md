# 上游来源

原项目：https://github.com/ns2250225/jiditie
上游提交：b446f05a176b31933c7676a059d9256cca7978ab
本地取得日期：2026-11-02

此目录直接基于上游源码进行本地试玩适配，保留上游游戏流程、画面、操作、NPC、随机事件和评价系统；修改为深圳 1 号线 30 站及对应主题文字，新增大厅入口，隔离存档键，阻止方向键滚动并在失焦时释放输入。
上游未提供明确 LICENSE；本地试玩适配不代表已取得公开发行或商业使用许可，发布前需向作者确认。

构建：npm ci --ignore-scripts --registry=https://registry.npmjs.org
npm run build
静态产物在 ../jiditie，通过 ../squeeze.html 进入。
深圳站名参考：https://jtys.sz.gov.cn/ydmh/jtcx/dtcx_180970/dtxl/content/post_12601090.html
关卡客流、时间、机制为虚构设定。

2026-11-02：增加 commute.css 统一游戏大厅配色，菜单和结算页改为米白/墨绿，缩窄 HUD，调整移动端线路滚动和安全区；移除远程 Google 字体依赖。
