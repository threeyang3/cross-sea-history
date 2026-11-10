# 内容维护说明

依 `app/content-types.ts` 维护 `app/data/catalog.json`，图片凭据见 `app/data/image-rights.json`。

- **增课**：复制完整课程，填唯一ID；group选tang/ming，lab仅用已有值。答案索引从0开始；同步课程与顶层terms。
- **来源**：各段sourceIds对应顶层sources.id，课级索引汇总。来源claim写清支持的结论；正文区分史实、推断与学习解释，保留“推测”等限定。
- **双语**：所有Pair补全zh/ja，含来源标题、题解、图注与替代文本；两版日期、人物和证据强度一致。
- **图片**：记录原图页、作者、许可链接、署名、裁切等改动及核实日期，同步catalog.assets。按src/filename核对文件；可浏览不等于可转载。
- **兼容**：课程、题目ID保持稳定；题意或选项顺序改变时用新题ID。旧摘记保持cross-sea-notes-v1的{note,question}；进度用cross-sea-learning-v2，语言用cross-sea-lang。内容更新不得清空旧记录；数据仅存当前浏览器。

## 双语历史时间线

- 数据在 `app/data/timeline.json`，类型见 `app/timeline-types.ts`。`track` 分为 exchange / china；事件 ID 稳定，支持 `#timeline/<track>/<id>` 深链接。
- 每件事必须补齐中日文日期、标题、背景摘要、学习意义、引导问题、地点及来源。每个 `sourceIds` 必须对应 sources；来源 claim 说明支持的具体信息。
- `start` / `end` 用历史纪年，公元前为负数，没有 0 年。人物生卒年、事件发生年、工程区间、文献刊行年分别标明；不把约年或阶段写成伪精确日期。
- `precision` 为 year / range / approx。完整显示日期的精度来自 date 字段；图上位置用起始年，跨时段材料保留区间说明。
- 六类主题用于阅读筛选，并不意味着事件只属于单一领域。`featured` 标示适合建立年代框架的重要节点。
- 图像仅从已有已核验资产中关联，并保留现代照片、后世画像、实物记录的图注与许可；不能把相关图片当作事件现场照片。
- `lessonId` 可关联已有短课；跨时间线的相近年代参照由年份自动选择，不代表直接因果关系。
- 导航时期在 `app/timeline-data.ts` 维护，允许边界重叠；不能把中国历史中的并存政权伪装成简单接续关系。
- 时间图谱按年距定位并聚合相近节点；同年多件事使用可选列表。编年卡片提供完整摘要，并能打开影响、问题和出处。
- 维护时检查双语完整性、ID 唯一、日期起讫、引用映射、关联课程和图片存在。新增事件后总数与筛选结果自动更新。
