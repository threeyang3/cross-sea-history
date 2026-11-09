# 内容维护说明

依 `app/content-types.ts` 维护 `app/data/catalog.json`，图片凭据见 `app/data/image-rights.json`。

- **增课**：复制完整课程，填唯一ID；group选tang/ming，lab仅用已有值。答案索引从0开始；同步课程与顶层terms。
- **来源**：各段sourceIds对应顶层sources.id，课级索引汇总。来源claim写清支持的结论；正文区分史实、推断与学习解释，保留“推测”等限定。
- **双语**：所有Pair补全zh/ja，含来源标题、题解、图注与替代文本；两版日期、人物和证据强度一致。
- **图片**：记录原图页、作者、许可链接、署名、裁切等改动及核实日期，同步catalog.assets。按src/filename核对文件；可浏览不等于可转载。
- **兼容**：课程、题目ID保持稳定；题意或选项顺序改变时用新题ID。旧摘记保持cross-sea-notes-v1的{note,question}；进度用cross-sea-learning-v2，语言用cross-sea-lang。内容更新不得清空旧记录；数据仅存当前浏览器。
