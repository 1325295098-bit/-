# 亚马逊设计作图排期表 - 云端部署版

这个目录是云端部署用的版本，包含页面、服务和当前数据。

## Render 部署建议

1. 把 `cloud-deploy` 目录上传到一个 GitHub 仓库。
2. 在 Render 新建 `Web Service`。
3. 选择这个仓库。
4. 设置：
   - Runtime: `Node`
   - Build Command: 留空或填 `npm install`
   - Start Command: `npm start`
5. 如果需要长期保存数据，添加 Persistent Disk：
   - Mount Path: `/var/data`
   - Environment Variable: `DATA_DIR=/var/data`

部署完成后，Render 会给你一个公网网址，大家用那个网址访问。

## 重要提醒

- 没有持久磁盘的话，云平台重启后可能回到初始数据。
- 当前数据已随 `schedule-data.json` 一起打包。
- 本地原来的网页和数据没有被改动。
